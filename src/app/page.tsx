export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome to the Ops & Developer Tools Hub. Select a tool from the
          sidebar to get started.
        </p>
      </div>

      <div className="min-h-[60vh] rounded-xl border border-dashed p-8 flex items-center justify-center bg-background">
        <span className="text-muted-foreground">Main Content Area</span>
      </div>
    </div>
  );
}
