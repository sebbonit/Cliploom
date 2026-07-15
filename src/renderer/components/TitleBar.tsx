import cliploomMark from '../assets/cliploom-mark.svg';

export function TitleBar() {
  return (
    <header className="titlebar">
      <div className="titlebar-drag" />
      <div className="titlebar-brand">
        <img className="brand-mark" src={cliploomMark} alt="" aria-hidden="true" />
        <span className="titlebar-title">Cliploom</span>
      </div>
    </header>
  );
}
