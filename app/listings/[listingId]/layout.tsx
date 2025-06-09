export default async function ListingLayout({
    children,
    }: Readonly<{
    children: React.ReactNode;
    }>) {
    return (
        <div>
            {children}
        </div>
    );
}
