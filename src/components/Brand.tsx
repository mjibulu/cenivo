import logo from "../assets/cenivo.svg";

export function Brand({ onClick }: { onClick?: () => void }) {
  const content = (
    <>
      <img src={logo} alt="" width={26} height={30} />
      <span>Cenivo</span>
    </>
  );
  return onClick ? (
    <button type="button" className="brand" onClick={onClick} aria-label="Cenivo demo home">
      {content}
    </button>
  ) : (
    <span className="brand">{content}</span>
  );
}
