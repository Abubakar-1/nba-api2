import { useReducer, Reducer } from "preact/hooks";

const toggleReducer = (state: boolean, nextValue?: boolean) =>
  typeof nextValue === "boolean" ? nextValue : !state;

const useToggle = (
  initialValue: boolean
): [boolean, (nextValue?: any) => void] => {
  return useReducer(toggleReducer, initialValue);
};

export default useToggle;
