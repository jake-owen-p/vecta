import { ApplyForm } from "../_components/ApplyForm";
import { Footer } from "../_components/Footer";
import { SelectionProcess } from "../_components/SelectionProcess";

const ApplyPage = () => {
  return (
    <div className="min-h-screen bg-[#090200]">
      <ApplyForm />
      <SelectionProcess />
      <Footer />
    </div>
  );
};

export default ApplyPage;


