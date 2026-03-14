import WallpaperGenerator from "../components/WallpaperGenerator";
import useTodos from "../hooks/useTodos";

const WallpaperPage = () => {
  const todayDate = new Date().toISOString().slice(0, 10);
  const { data } = useTodos(todayDate);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <WallpaperGenerator todos={data} />
      </div>
    </div>
  );
};

export default WallpaperPage;
