import ClientRoutePage from "./home/controllers/ClientRoutePage";
import ClientContactView from "./home/views/ClientContactView";

function ContactPage() {
  return <ClientRoutePage primaryView={ClientContactView} />;
}

export default ContactPage;
