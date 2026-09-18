interface HomeIconProps {
  className?: string;
}

// Matches the home glyph used by the CXFabric portal navigation.
export const HomeIcon = ({ className }: HomeIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.8689 4.34779C12.8745 3.22981 11.1273 3.2298 10.1329 4.34779L4.26489 10.945C4.08869 11.1431 3.99836 11.4031 4.01378 11.6678L4.39105 18.1454C4.46805 19.4674 5.56257 20.5 6.88682 20.5H17.1134C18.4375 20.5 19.5319 19.4677 19.6092 18.1459L19.988 11.6679C20.0034 11.4032 19.9131 11.1431 19.7369 10.945L13.8689 4.34779ZM10.8801 5.01239C11.4768 4.3416 12.525 4.3416 13.1217 5.01239L18.9897 11.6096L18.6109 18.0876C18.5645 18.8806 17.9079 19.5 17.1134 19.5H14.5V15C14.5 14.1716 13.8284 13.5 13 13.5H11C10.1716 13.5 9.5 14.1716 9.5 15V19.5H6.88682C6.09227 19.5 5.43556 18.8804 5.38936 18.0872L5.01209 11.6096L10.8801 5.01239ZM10.5 19.5H13.5V15C13.5 14.7239 13.2761 14.5 13 14.5H11C10.7239 14.5 10.5 14.7239 10.5 15V19.5Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
    />
  </svg>
);
