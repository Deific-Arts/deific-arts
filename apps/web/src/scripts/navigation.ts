export const deepLink = (event: Event, link: string) => {
  event.preventDefault();
  const formattedLink = link.replace('/', '');
  const { search } = window.location;

  if (formattedLink) {
    const newUrl = `${link}/${search}`;
    window.history.replaceState(null, '', newUrl);
    const target = document.querySelector(`deific-${formattedLink}`);
    target && target.scrollIntoView({ behavior: 'smooth' });
  }
}
