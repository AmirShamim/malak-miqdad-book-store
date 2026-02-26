// Redirect old /services/portfolio to /portfolio
export default function PortfolioRedirect() { return null }

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/portfolio',
      permanent: true, // 308 redirect — SEO juice transfers
    },
  }
}
