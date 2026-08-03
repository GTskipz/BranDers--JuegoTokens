import "./Logo.scss";
import logo from "../../assets/images/logo-gradient.svg";

export function Logo() {
  return (
    <img
      className="logo"
      src={logo}
      alt="Mi McDonald's"
      draggable={false}
    />
  );
}