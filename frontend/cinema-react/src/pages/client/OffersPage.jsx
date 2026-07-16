import ClientRoutePage from "./home/controllers/ClientRoutePage";
import ClientOffersView from "./home/views/ClientOffersView";

function OffersPage() {
  return <ClientRoutePage primaryView={ClientOffersView} />;
}

export default OffersPage;
