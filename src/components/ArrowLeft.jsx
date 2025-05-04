import { ArrowIconLeft } from './ArrowIcon.jsx';
import './styleArrowLeft.css';

export function ArrowLeft() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <button className="btn-voltar" onClick={handleGoBack}>
      <span className="btn-face-white">
        Voltar
        <ArrowIconLeft />
      </span>
      <span className="btn-face-purple">
        Voltar
        <ArrowIconLeft />
      </span>
    </button>
  );
}