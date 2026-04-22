import Skeleton from "./ui/Skeleton";
import { useMobile } from "../hooks/useMobile";

const TasksSkeleton = () => {
  const isMobile = useMobile();
  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      <div className={`${isMobile ? "" : "flex justify-between"} items-center gap-4`}>
        <div>
           <Skeleton width={150} height={40} className="!mb-2" />
           <Skeleton width={isMobile ? 250 : 350} height={16} className={isMobile ? "!mb-4" : ""} />
        </div>
        <div className={`flex ${isMobile ? "flex-col w-full" : "row"} gap-3 items-center`}>
            <Skeleton width={isMobile ? "100%" : 140} height={40} borderRadius={10} />
            {!isMobile && <Skeleton width={160} height={40} borderRadius={16} />}
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl !p-4 flex items-end flex-wrap gap-4">
        <Skeleton width={isMobile ? "100%" : 200} height={36} borderRadius={8} />
        {!isMobile && (
          <>
            <div className="w-px h-10 bg-[var(--border)] self-end" />
            <Skeleton width={120} height={36} borderRadius={8} />
            <Skeleton width={120} height={36} borderRadius={8} />
            <Skeleton width={120} height={36} borderRadius={8} />
            <div className="w-px h-10 bg-[var(--border)] self-end" />
            <Skeleton width={140} height={36} borderRadius={8} />
          </>
        )}
      </div>

      <div className={isMobile ? "flex flex-col gap-4 !pb-10" : "grid grid-cols-4 gap-6 overflow-x-auto !pb-6 custom-scrollbar"}>
        {[1, 2, 3, 4].map(i => (
           <div key={i} className="flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center !px-1">
                 <Skeleton width={80} height={16} />
                 <Skeleton width={24} height={18} borderRadius={999} />
              </div>
              {[1, 2, 3].map(j => (
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
  );
};
export default TasksSkeleton;
