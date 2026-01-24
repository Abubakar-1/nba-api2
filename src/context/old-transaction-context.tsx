import { createContainer } from "unstated-next";
import { useState } from "preact/hooks";
import { IOldTransaction } from "@/api/interfaces/transaction";

function Context() {
  const [oldReceiptInfo, setOldReceiptInfo] = useState<IOldTransaction>();

  return {
    oldReceiptInfo,
    setOldReceiptInfo,
  };
}

let OldTransactionContext = createContainer(Context);

export default OldTransactionContext;
