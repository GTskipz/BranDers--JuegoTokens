import "./InactiveScreen.scss";

export function InactiveScreen() {
  return (
    <section className="inactive-screen">
      <div className="inactive-content">
        <div className="inactive-icon">🔒</div>
        <h1 className="inactive-title">Kiosco no disponible</h1>
        <p className="inactive-subtitle">
          No hay una sesión activa en este momento.
          <br />
          Consulta con el administrador.
        </p>
      </div>
    </section>
  );
}
