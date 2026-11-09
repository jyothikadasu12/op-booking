import { Toaster } from "sonner";

const AppProviders = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3000}
      />
    </>
  );
};

export default AppProviders;