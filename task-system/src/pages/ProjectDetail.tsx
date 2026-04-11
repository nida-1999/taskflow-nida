import { useParams } from "react-router-dom";
import TasksPage from "./TasksPage";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  return <TasksPage projectId={id} />;
};

export default ProjectDetail;
