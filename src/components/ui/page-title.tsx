import { FunctionalComponent } from "preact";

interface Props {
  title?: string;
}
const PageTitle: FunctionalComponent<Props> = ({ title = "Home" }) => {
  return <title>{title + " / NBA Portal"}</title>;
};
export default PageTitle;
