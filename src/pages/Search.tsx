import { GlobalSearch } from '@/components/search/GlobalSearch';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

const Search = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-8">
        <h1 className="text-2xl font-bold mb-4">Buscar</h1>
        <GlobalSearch />
      </main>
      <BottomNav />
    </div>
  );
};

export default Search;
