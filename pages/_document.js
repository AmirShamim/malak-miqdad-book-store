import { Html, Head, Main, NextScript } from 'next/document'

const setInitialTheme = `(function(){
  try{
    var stored = localStorage.getItem('theme');
    if(stored === 'dark'){
      document.documentElement.classList.add('dark');
    } else if(stored === 'light'){
      document.documentElement.classList.remove('dark');
    } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
      document.documentElement.classList.add('dark');
    }
  }catch(e){}
})();`

export default function Document(){
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#a68b65" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
