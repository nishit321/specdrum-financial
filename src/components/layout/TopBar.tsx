export function TopBar() {
  return (
    <div className="sbf-topbar">
      <div className="container">
        <div className="sbf-topbar-row">
          <p className="sbf-topbar-text mb-0">
            <svg className="sbf-icon"><use href="#sbf-i-clock" /></svg> Call now to receive funding <strong>within 24 hours</strong>
          </p>
          <div className="sbf-topbar-links">
            <span className="sbf-topbar-item d-none d-md-inline-flex">
              <svg className="sbf-icon"><use href="#sbf-i-pin" /></svg> Los Alamitos, CA
            </span>{' '}
            <a className="sbf-topbar-item" href="tel:18002147498">
              <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg> 1-800-214-7498
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
