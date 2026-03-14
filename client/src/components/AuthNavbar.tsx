import { Link } from "react-router-dom";
import brand from "../assets/brand.jpg";

type AuthNavbarProps = {
  brandName: string;
  promptText: string;
  actionText: string;
  actionTo: string;
};

function AuthNavbar({
  brandName,
  promptText,
  actionText,
  actionTo,
}: AuthNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e3e9e5] bg-white/95 shadow-[0_1px_8px_rgba(21,38,50,0.08)] backdrop-blur">
      <div className="container flex min-h-[82px] items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img
            src={brand}
            alt={brandName}
            className="h-9 w-9 rounded-sm object-cover"
          />
          <span className="text-[1.9rem] font-bold text-[#29613d]">
            {brandName}
          </span>
        </Link>

        <p className="text-sm text-[#5f6f7c] md:text-[1.05rem]">
          {promptText}{" "}
          <Link
            to={actionTo}
            className="font-bold text-[#29613d] hover:underline hover:text-[#e4bf3f]"
          >
            {actionText}
          </Link>
        </p>
      </div>
    </header>
  );
}

export default AuthNavbar;
