interface Props {
  className?: string;
}
const AddSingleIcon = ({ className }: Props) => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="15" cy="15" r="14.5" fill="#5A2391" fill-opacity="0.2" />
      <path
        d="M15 13.5C16.3807 13.5 17.5 12.3807 17.5 11C17.5 9.61929 16.3807 8.5 15 8.5C13.6193 8.5 12.5 9.61929 12.5 11C12.5 12.3807 13.6193 13.5 15 13.5Z"
        stroke="#5A2391"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10.5 20.4999H15H19.5V19.9578C19.492 19.1956 19.291 18.4478 18.9157 17.7843C18.5404 17.1209 18.0031 16.5634 17.3539 16.1639C16.7048 15.7644 15.9649 15.536 15.2035 15.4999C15.1356 15.4967 15.0678 15.495 15 15.4949C14.9322 15.495 14.8644 15.4967 14.7965 15.4999C14.0351 15.536 13.2952 15.7644 12.6461 16.1639C11.9969 16.5634 11.4596 17.1209 11.0843 17.7843C10.709 18.4478 10.508 19.1956 10.5 19.9578V20.4999Z"
        stroke="#5A2391"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default AddSingleIcon;
