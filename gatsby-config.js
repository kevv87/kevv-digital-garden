module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-garden`,
      options: {
        contentPath: `${__dirname}/content/garden`,
        rootNote: `/hello_world`,
      },
    },
  ],
  siteMetadata: {
    title: `kev's digital garden`,
  },
}
