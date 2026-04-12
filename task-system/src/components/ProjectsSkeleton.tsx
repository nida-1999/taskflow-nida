import Skeleton from "./ui/Skeleton";
import { useMobile } from "../hooks/useMobile";

const ProjectsSkeleton = () => {
  const isMobile = useMobile();
  return (
    <div className="animate-fade-in w-full">
      <div className="flex items-center justify-between !mb-10">
        <div>
           <Skeleton width={140} height={36} className="!mb-2" />
           <Skeleton width={250} height={16} />
        </div>
         <Skeleton width={isMobile ? 80 : 140} height={40} borderRadius={10} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
         {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card !p-6 flex flex-col min-h-[160px]">
               <Skeleton width="70%" height={24} className="!mb-3" />
               <Skeleton width="100%" height={48} className="!mb-6" />
               
               <div className="mt-auto">
                   <div className="flex justify-between !mb-2">
                       <Skeleton width={60} height={12} />
                       <Skeleton width={30} height={12} />
                   </div>
                   <Skeleton width="100%" height={4} borderRadius={999} className="!mb-4" />
                   <Skeleton width={120} height={12} />
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};
export default ProjectsSkeleton;
