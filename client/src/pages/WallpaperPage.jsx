import AppNavbar from "../components/layout/AppNavbar";

const WallpaperPage = () => {
  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="mx-auto w-full max-w-4xl px-4 pb-10 md:px-6">
        <section className="card p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brandSecondary">Wallpaper</p>
          <h1 className="mt-2 text-3xl font-bold">Motivational Wallpaper Studio</h1>
          <p className="mt-3 text-textSecondary">
            Wallpaper generation UI can be added here. The dashboard action now routes correctly to this page.
          </p>
        </section>
      </main>
    </div>
  );
};

export default WallpaperPage;
