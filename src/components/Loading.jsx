import "./Loading.css";

export default function Loading() {
  return (
    <div className="custom-loading-container">
      <div className="custom-spinner" />
      <p className="custom-loading-text">Carregando...</p>
    </div>
  );
}
