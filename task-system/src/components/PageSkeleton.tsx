import Skeleton from "./ui/Skeleton";

const PageSkeleton = () => {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* Mock Header */}
      <header
        style={{
          height: 64,
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="container !px-4 md:px-6"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "1300px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Skeleton width={32} height={32} borderRadius={8} />
            <Skeleton width={100} height={20} />
          </div>

          <div className="hidden md:flex" style={{ gap: 8 }}>
            <Skeleton width={80} height={32} borderRadius={999} />
            <Skeleton width={80} height={32} borderRadius={999} />
            <Skeleton width={80} height={32} borderRadius={999} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Skeleton width={24} height={24} circle />
            <Skeleton width={36} height={36} circle />
            <Skeleton width={80} height={32} borderRadius={8} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1300px] w-[100%] !p-4 md:!p-6 !mx-auto pb-24 md:pb-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <Skeleton width={200} height={32} />
              <Skeleton width={300} height={16} />
            </div>
            <div className="flex gap-3">
              <Skeleton width={120} height={40} borderRadius={10} />
              <Skeleton className="hidden md:block" width={150} height={40} borderRadius={16} />
            </div>
          </div>

          {/* Filter Bar Mock */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl !p-4 flex flex-wrap gap-4">
            <Skeleton width={200} height={36} borderRadius={8} />
            <div className="w-px h-10 bg-[var(--border)] hidden md:block" />
            <Skeleton width={120} height={36} borderRadius={8} />
            <Skeleton width={120} height={36} borderRadius={8} />
            <Skeleton width={120} height={36} borderRadius={8} />
          </div>

          {/* Grid Mock */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="flex justify-between items-center !px-1">
                  <Skeleton width={80} height={16} />
                  <Skeleton width={24} height={18} borderRadius={999} />
                </div>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="card !p-4 flex flex-col gap-3">
                    <Skeleton width="100%" height={20} />
                    <Skeleton width="60%" height={14} />
                    <div className="flex justify-between mt-2">
                      <Skeleton width={24} height={24} circle />
                      <Skeleton width={60} height={18} borderRadius={4} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Mock */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center !p-2 bg-[var(--bg-secondary)] border-t border-[var(--border)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1 w-full !py-2">
            <Skeleton width={20} height={20} />
            <Skeleton width={40} height={10} />
          </div>
        ))}
      </nav>
    </div>
  );
};

export default PageSkeleton;
