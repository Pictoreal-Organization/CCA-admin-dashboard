import { Suspense } from  "react"; 
import EditMember from "./EditMember";

export default  function EditMemberPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditMember />
    </Suspense>
  );
}