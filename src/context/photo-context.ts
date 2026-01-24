import { createContainer } from "unstated-next";
import { useState } from "preact/hooks";
import { ITransactionDetails } from "@/api/interfaces/transaction";

function Context() {
  const [photoInfo, setPhotoInfo] = useState<ITransactionDetails>();

  return {
    photoInfo,
    setPhotoInfo,
  };
}

let PhotoContext = createContainer(Context);

export default PhotoContext;
