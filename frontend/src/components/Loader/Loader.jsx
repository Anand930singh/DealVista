import dealVistaLogo from "../../assets/DealVista.png"
import "./loader.css"

export function Loader({ message = "Loading..." }) {
  return (
    <div className="loader-container">
      <div className="loader-wrapper">
        <div className="loader-ring"></div>
        <img src={dealVistaLogo} alt="DealVista" className="loader-logo" />
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  )
}
