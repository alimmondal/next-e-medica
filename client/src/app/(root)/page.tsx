import ProductList from "@/components/shared/product/product-list";

export default async function Home() {
  const res = await fetch("http://localhost:5001/products", {
    next: {
      revalidate: 30,
    },
  });
  const product = await res.json();
  // console.log(blogs);
  return (
    <div className="space-y-8">
      <ProductList data={product} title="Latest Products" />
    </div>
  );
}
