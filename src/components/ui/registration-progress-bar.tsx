import classnames from "classnames";
import { FunctionalComponent, Fragment } from "preact";

interface Props {
  stage: number;
}
const RegistrationProgressBar: FunctionalComponent<Props> = ({ stage = 0 }) => {
  return (
    <>
      <div className="flex flex-col justify-center items-center w-fit">
        <div className="relative">
          <div
            className={classnames(
              "w-fit rounded-full flex justify-center items-center",
              { "bg-green-50 p-1": stage >= 1 }
            )}
          >
            <div
              className={classnames(
                "rounded-full border-2 bg-white inline-flex justify-center items-center",
                { "border-primary-500 ": stage >= 1 },
                { "bg-gray-300 border-gray-300": stage < 1 }
              )}
            >
              <div
                className={classnames(
                  "w-3 h-3 rounded-full m-2.5",
                  { "bg-primary-500": stage >= 1 },
                  { "bg-gray-300": stage < 1 }
                )}
              ></div>
            </div>
          </div>
          <p
            className={classnames(
              "absolute top-3 left-14 w-20 text-sm font-semibold",
              { "top-3": stage >= 1 },
              { "top-2": stage < 1 }
            )}
          >
            Register
          </p>
        </div>
        <div className="relative">
          <div className="flex flex-col justify-center items-center w-fit">
            <div
              className={classnames(
                "h-8 w-[0.15rem]",
                { "bg-primary-500": stage >= 2 },
                { "bg-gray-300": stage < 2 }
              )}
            ></div>
            <div
              className={classnames(
                " w-fit rounded-full flex justify-center items-center",
                { "bg-green-50 p-1": stage >= 2 }
              )}
            >
              <div
                className={classnames(
                  "rounded-full border-2  bg-white inline-flex justify-center items-center",
                  { "border-primary-500": stage >= 2 },
                  { "border-gray-300": stage < 2 }
                )}
              >
                <div
                  className={classnames(
                    "w-3 h-3 rounded-full m-2.5",
                    { "bg-primary-500": stage >= 2 },
                    { "bg-white": stage < 2 }
                  )}
                ></div>
              </div>
            </div>
          </div>
          <p
            className={classnames(
              "absolute left-14 w-32 text-sm font-semibold",
              { "top-11": stage >= 2 },
              { "top-10": stage < 2 }
            )}
          >
            Preview and Save
          </p>
        </div>
        <div className="relative">
          <div className="flex flex-col justify-center items-center w-fit">
            <div
              className={classnames(
                "h-8 w-[0.15rem]",
                { "bg-primary-500": stage >= 3 },
                { "bg-gray-300": stage < 3 }
              )}
            ></div>
            <div
              className={classnames(
                "w-fit rounded-full flex justify-center items-center",
                { "bg-green-50 p-1 ": stage >= 3 }
              )}
            >
              <div
                className={classnames(
                  "rounded-full border-2 bg-white inline-flex justify-center items-center",
                  { "border-primary-500": stage >= 3 },
                  { "border-gray-300": stage < 3 }
                )}
              >
                <div
                  className={classnames(
                    "w-3 h-3 rounded-full m-2.5",
                    { "bg-primary-500": stage >= 3 },
                    { "bg-white": stage < 3 }
                  )}
                ></div>
              </div>
            </div>
          </div>
          <p
            className={classnames(
              "absolute left-14 w-28 text-sm font-semibold",
              { "top-11": stage > 2 },
              { "top-10": stage === 2 },
              { "top-10": stage < 2 }
            )}
          >
            Make Payment
          </p>
        </div>
      </div>
    </>
  );
};
export default RegistrationProgressBar;
