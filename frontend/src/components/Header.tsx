import logo from "../assets/images/notegame-logo.png";

const Header = () => {
  return (
    <>
      <header className="absolute h-12 w-full bg-[#ffffff] top-0 left-0 flex items-center border-[#111827] border-y px-2">
        <img
          src={logo}
          alt="Notegame Logo"
          className="h-10"
          draggable={false}
        />
      </header>
    </>
  );
};

export default Header;
