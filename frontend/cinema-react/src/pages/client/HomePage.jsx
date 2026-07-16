import ClientRoutePage from "./home/controllers/ClientRoutePage";
import ClientHomeView from "./home/views/ClientHomeView";

function HomePage() {
  return <ClientRoutePage primaryView={ClientHomeView} />;
}

export default HomePage;
