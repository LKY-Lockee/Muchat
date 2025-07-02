declare module '*.png' {
  const value: string
  export default value
}

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
