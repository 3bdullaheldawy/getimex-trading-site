/** Re-mounts on every navigation, so the curtain wipes away each time a page arrives. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <>
    <div className="curtain" aria-hidden="true"><span /></div>
    {children}
  </>;
}
