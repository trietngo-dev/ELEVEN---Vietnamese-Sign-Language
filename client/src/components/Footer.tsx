import { viText } from "../locales/vi";
import brand from "../assets/brand.jpg";

function Footer() {
  const { common, footer } = viText;

  return (
    <footer className="border-t border-[#e7ece9] bg-[#f9fcfa]">
      <div className="container flex min-h-[78px] flex-col items-center justify-center gap-4 py-4 lg:flex-row lg:justify-between lg:py-0">
        <div className="inline-flex items-center gap-2.5">
          <img
            src={brand}
            alt={common.brandName}
            className="h-8 w-8 shrink-0 rounded-sm object-cover"
          />{" "}
          <span className="text-base font-bold text-[#29613d]">
            {common.brandName}
          </span>
        </div>

        <p className="m-0 text-[0.84rem] text-[#98a3a7]">{footer.copy}</p>

        <nav aria-label={footer.navAriaLabel}>
          <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-3.5 p-0">
            {footer.links.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-[0.82rem] text-[#839097]">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
