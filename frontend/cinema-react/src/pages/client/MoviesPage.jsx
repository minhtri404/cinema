import ClientRoutePage from "./home/controllers/ClientRoutePage";
import ClientMoviesView from "./home/views/ClientMoviesView";

function MoviesPage() {
  return <ClientRoutePage primaryView={ClientMoviesView} />;
}

export default MoviesPage;
