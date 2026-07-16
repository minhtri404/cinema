import ClientRoutePage from "./home/controllers/ClientRoutePage";
import ClientScheduleView from "./home/views/ClientScheduleView";

function SchedulePage() {
  return <ClientRoutePage primaryView={ClientScheduleView} />;
}

export default SchedulePage;
