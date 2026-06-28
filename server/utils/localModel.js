import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../.local-db");

const shouldUseLocal = () => {
  // Never use local fallback in production — Render's filesystem is ephemeral and
  // silently storing data there causes a race: registrations written to JSON during
  // cold-start are lost once MongoDB connects, making those users unable to log in.
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.DISABLE_LOCAL_DB_FALLBACK === "true") return false;
  return mongoose.connection.readyState !== 1;
};

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const getFilePath = (collection) => path.join(dataDir, `${collection}.json`);

const readRows = (collection) => {
  ensureDataDir();
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
};

const writeRows = (collection, rows) => {
  ensureDataDir();
  fs.writeFileSync(getFilePath(collection), JSON.stringify(rows, null, 2));
};

const toComparable = (value) => {
  if (value?._id) {
    return String(value._id);
  }
  return String(value);
};

const matchesFilter = (row, filter = {}) => {
  if (!filter || Object.keys(filter).length === 0) {
    return true;
  }

  return Object.entries(filter).every(([key, expected]) => {
    if (key === "$or") {
      return Array.isArray(expected) && expected.some((entry) => matchesFilter(row, entry));
    }

    const actual = row[key];

    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
      if ("$in" in expected) {
        return expected.$in.map(toComparable).includes(toComparable(actual));
      }

      return toComparable(actual) === toComparable(expected);
    }

    return toComparable(actual) === toComparable(expected);
  });
};

const applyUpdate = (target, update = {}) => {
  const payload = update.$set && typeof update.$set === "object" ? update.$set : update;
  Object.assign(target, payload, { updatedAt: new Date().toISOString() });
};

class LocalDocument {
  constructor(collection, data, defaults = {}) {
    Object.assign(this, defaults, data);
    this._collection = collection;
    this._defaults = defaults;
  }

  toJSON() {
    const { _collection, _defaults, ...data } = this;
    return data;
  }

  async save() {
    const rows = readRows(this._collection);
    const index = rows.findIndex((row) => toComparable(row._id) === toComparable(this._id));
    const data = this.toJSON();
    data.updatedAt = new Date().toISOString();

    if (index >= 0) {
      rows[index] = data;
    } else {
      rows.push(data);
    }

    writeRows(this._collection, rows);
    Object.assign(this, data);
    return this;
  }
}

class LocalQuery {
  constructor(executor) {
    this.executor = executor;
    this.sortSpec = null;
    this.limitCount = null;
  }

  select() {
    return this;
  }

  sort(spec = {}) {
    this.sortSpec = spec;
    return this;
  }

  limit(count) {
    this.limitCount = Number(count);
    return this;
  }

  async exec() {
    let value = await this.executor();

    if (Array.isArray(value) && this.sortSpec) {
      const entries = Object.entries(this.sortSpec);
      value = [...value].sort((a, b) => {
        for (const [key, direction] of entries) {
          if (a[key] === b[key]) {
            continue;
          }
          return a[key] > b[key] ? direction : -direction;
        }
        return 0;
      });
    }

    if (Array.isArray(value) && Number.isFinite(this.limitCount)) {
      value = value.slice(0, this.limitCount);
    }

    return value;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

export const createHybridModel = (mongoModel, collection, defaults = {}) => {
  const makeDocument = (data) => new LocalDocument(collection, { ...defaults, ...data }, defaults);

  const localApi = {
    create: async (payload) => {
      const now = new Date().toISOString();
      const doc = makeDocument({
        _id: new mongoose.Types.ObjectId().toString(),
        createdAt: now,
        updatedAt: now,
        ...payload
      });
      await doc.save();
      return doc;
    },
    insertMany: async (items = []) => Promise.all(items.map((item) => localApi.create(item))),
    find: (filter = {}) =>
      new LocalQuery(async () => readRows(collection).filter((row) => matchesFilter(row, filter)).map(makeDocument)),
    findOne: (filter = {}) =>
      new LocalQuery(async () => {
        const row = readRows(collection).find((entry) => matchesFilter(entry, filter));
        return row ? makeDocument(row) : null;
      }),
    findById: (id) => localApi.findOne({ _id: id }),
    findOneAndUpdate: async (filter = {}, update = {}, options = {}) => {
      const rows = readRows(collection);
      let row = rows.find((entry) => matchesFilter(entry, filter));

      if (!row && options.upsert) {
        row = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...defaults,
          ...filter,
          createdAt: new Date().toISOString()
        };
        rows.push(row);
      }

      if (!row) {
        return null;
      }

      applyUpdate(row, update);
      writeRows(collection, rows);
      return makeDocument(row);
    },
    findOneAndDelete: async (filter = {}) => {
      const rows = readRows(collection);
      const index = rows.findIndex((row) => matchesFilter(row, filter));
      if (index < 0) {
        return null;
      }
      const [deleted] = rows.splice(index, 1);
      writeRows(collection, rows);
      return makeDocument(deleted);
    },
    updateOne: async (filter = {}, update = {}) => {
      const rows = readRows(collection);
      const row = rows.find((entry) => matchesFilter(entry, filter));
      if (row) {
        applyUpdate(row, update);
        writeRows(collection, rows);
      }
      return { modifiedCount: row ? 1 : 0 };
    },
    deleteOne: async (filter = {}) => {
      const rows = readRows(collection);
      const nextRows = rows.filter((row) => !matchesFilter(row, filter));
      writeRows(collection, nextRows);
      return { deletedCount: rows.length - nextRows.length };
    },
    deleteMany: async (filter = {}) => {
      const rows = readRows(collection);
      const nextRows = rows.filter((row) => !matchesFilter(row, filter));
      writeRows(collection, nextRows);
      return { deletedCount: rows.length - nextRows.length };
    },
    countDocuments: async (filter = {}) => readRows(collection).filter((row) => matchesFilter(row, filter)).length
  };

  return new Proxy(mongoModel, {
    get(target, property) {
      if (shouldUseLocal() && property in localApi) {
        return localApi[property];
      }
      return target[property];
    }
  });
};

export const isLocalDataFallbackActive = shouldUseLocal;
