import { ApplyForm } from "../_components/ApplyForm";
import { Footer } from "../_components/Footer";
import { SelectionProcess } from "../_components/SelectionProcess";
import { SiteToolbar } from "../_components/SiteToolbar";

const ApplyPage = () => {
  return (
    <div className="min-h-screen bg-[#090200]">
      <SiteToolbar />
      <ApplyForm />
      <SelectionProcess />
      <Footer />
    </div>
  );
};

export default ApplyPage;


