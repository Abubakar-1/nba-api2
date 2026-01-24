import { FunctionComponent, Fragment } from "preact";
import bpfBack from "../assets/images/bpf_back.jpg";
import stampBack from "../assets/images/stamp_back.jpg";
import nba_logo from "../assets/images/nba_logo.png";
import nba_logo_sm from "../assets/images/logo.png";
import coa from "../assets/images/coa.jpg";
const Hodim: FunctionComponent = () => {
  return (
    <>
      <img src={bpfBack} />
      <img src={stampBack} />
      <img src={nba_logo} />
      <img src={nba_logo_sm} />
      <img src={coa} />
    </>
  );
};
export default Hodim;
