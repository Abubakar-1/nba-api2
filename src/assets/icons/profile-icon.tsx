interface Props {
  className?: string;
}
const ProfileIcon = ({ className }: Props) => {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.4983 11.3572C12.3721 11.3572 13.8912 9.83821 13.8912 7.96439C13.8912 6.09057 12.3721 4.57153 10.4983 4.57153C8.6245 4.57153 7.10547 6.09057 7.10547 7.96439C7.10547 9.83821 8.6245 11.3572 10.4983 11.3572Z"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4.70312 16.6501C5.30874 15.656 6.15989 14.8344 7.17476 14.2643C8.18963 13.6942 9.33409 13.3948 10.4981 13.3948C11.6622 13.3948 12.8066 13.6942 13.8215 14.2643C14.8364 14.8344 15.6875 15.656 16.2931 16.6501"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10.5011 18.8213C15.3731 18.8213 19.3225 14.8718 19.3225 9.9999C19.3225 5.12795 15.3731 1.17847 10.5011 1.17847C5.62918 1.17847 1.67969 5.12795 1.67969 9.9999C1.67969 14.8718 5.62918 18.8213 10.5011 18.8213Z"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default ProfileIcon;
