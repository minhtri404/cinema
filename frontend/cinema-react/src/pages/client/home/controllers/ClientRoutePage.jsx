import ClientShell from "../components/ClientShell";
import ClientAccountView from "../views/ClientAccountView";
import ClientBookingView from "../views/ClientBookingView";
import ClientMovieDetailView from "../views/ClientMovieDetailView";
import useClientHomeController from "./useClientHomeController";

function ClientRoutePage({ primaryView: PrimaryView }) {
  const controller = useClientHomeController();
  const { auth, bookingMovie, bookingShowtime, selectedMovie, view } = controller;

  let content = <PrimaryView controller={controller} />;
  if (view === "account" && auth) content = <ClientAccountView controller={controller} />;
  if (view === "movieDetail" && selectedMovie) content = <ClientMovieDetailView controller={controller} />;
  if (view === "booking" && bookingMovie && bookingShowtime) content = <ClientBookingView controller={controller} />;

  return <ClientShell controller={controller}>{content}</ClientShell>;
}

export default ClientRoutePage;
