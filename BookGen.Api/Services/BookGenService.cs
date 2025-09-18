using System.Text;
using System.Security.Cryptography;

namespace BookGen.Api.Services;

// ✅ Strong DTO for reviews (no tuples -> clean JSON)
public record ReviewDto(string Reviewer, string Text);

// ✅ Strong DTO for details (authors kept as List<string>)
public record BookDetailsDto(
    int Index,
    string Title,
    List<string> Authors,
    string Publisher,
    string CoverUrl,
    int Likes,
    List<ReviewDto> Reviews
);

public class BookGenService
{
    private readonly LocaleData _data = new();

    public List<BookRow> GenerateBooks(string region, long seed, double likesMean, double reviewsMean, int page, int size)
    {
        var loc = _data.GetRegion(region);
        var result = new List<BookRow>(size);
        int startIdx = (page - 1) * size + 1;

        for (int i = 0; i < size; i++)
        {
            int absoluteIndex = startIdx + i;
            var rng = StableRng(region, seed, absoluteIndex);

            string title = MakeTitle(loc, rng);
            var authors = MakeAuthors(loc, rng);
            string publisher = loc.Publishers[rng.Next(loc.Publishers.Count)];
            string isbn = Isbn.GenerateIsbn13(rng);

            result.Add(new BookRow(
                Index: absoluteIndex,
                ISBN: isbn,
                Title: title,
                Authors: authors,
                Publisher: publisher
            ));
        }
        return result;
    }

    // ✅ Return the DTO with explicit ReviewDto list
    public BookDetailsDto GenerateDetails(string region, long seed, int absoluteIndex, double likesMean, double reviewsMean)
    {
        var loc = _data.GetRegion(region);

        // identity RNG for title/authors/publisher so they never change when likes/reviews change
        var rngIdentity = StableRng(region, seed, absoluteIndex);

        string title = MakeTitle(loc, rngIdentity);
        var authors = MakeAuthors(loc, rngIdentity);
        string publisher = loc.Publishers[rngIdentity.Next(loc.Publishers.Count)];

        // counts RNG uses a different salt so identity fields remain stable
        var rngCounts = StableRng(region, seed, absoluteIndex, extraSalt: 991);
        int likes = SampleMeanWithFraction(likesMean, rngCounts);

        int baseReviews = (int)Math.Floor(reviewsMean);
        bool addExtra = rngCounts.NextDouble() < (reviewsMean - baseReviews + 1e-12);
        int totalReviews = Math.Max(0, baseReviews + (addExtra ? 1 : 0));

        // ✅ Build proper ReviewDto objects (no tuples)
        var reviews = new List<ReviewDto>(totalReviews);
        for (int i = 0; i < totalReviews; i++)
        {
            var r = StableRng(region, seed, absoluteIndex, extraSalt: 3000 + i);
            string reviewer = MakePerson(loc, r);
            string text = MakeReview(loc, r);
            reviews.Add(new ReviewDto(reviewer, text));
        }

        string coverUrl = $"/api/cover.svg?region={Uri.EscapeDataString(region)}&seed={seed}&index={absoluteIndex}";
        return new BookDetailsDto(absoluteIndex, title, authors, publisher, coverUrl, likes, reviews);
    }

    public string GenerateCoverSvg(string region, long seed, int absoluteIndex, int w, int h)
    {
        var rng = StableRng(region, seed, absoluteIndex, extraSalt: 777);
        var loc = _data.GetRegion(region);

        string title = MakeTitle(loc, StableRng(region, seed, absoluteIndex));
        var authors = MakeAuthors(loc, StableRng(region, seed, absoluteIndex));
        string author = string.Join(", ", authors);

        var hue = rng.Next(0, 360);
        var sat = 55 + rng.Next(25);
        var light = 70 + rng.Next(10);
        var bg = $"hsl({hue} {sat}% {light}%)";

        var sb = new StringBuilder();
        sb.Append($$"""
        <svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="{{bg}}" />
              <stop offset="1" stop-color="white" stop-opacity="0.4" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
          <rect x="20" y="20" width="{{w-40}}" height="{{h-40}}" rx="18" fill="white" opacity="0.35"/>
          <text x="28" y="80" font-family="Segoe UI, Roboto, Arial" font-size="28" font-weight="700">{{EscapeXml(title)}}</text>
          <text x="28" y="120" font-family="Segoe UI, Roboto, Arial" font-size="16" fill="#333">{{EscapeXml(author)}}</text>
        </svg>
        """
        );
        return sb.ToString();
    }

    // ===== helpers =====

    // Stable, cross-runtime RNG seed: SHA-256 of (regionCode|seed|index|salt)
    private static Random StableRng(string region, long seed, int absoluteIndex, int extraSalt = 0)
    {
        int regionCode = region.ToLowerInvariant() switch
        {
            "fr" or "fr-fr" or "france" => 1,
            "tr" or "tr-tr" or "turkiye" or "turkey" => 2,
            _ => 0
        };

        string material = $"{regionCode}|{seed}|{absoluteIndex}|{extraSalt}";
        byte[] bytes = Encoding.UTF8.GetBytes(material);
        byte[] hash = SHA256.HashData(bytes);
        int seed32 = BitConverter.ToInt32(hash, 0);
        return new Random(seed32);
    }

    private static string MakeTitle(LocalePack loc, Random rng)
    {
        var p = rng.Next(4);
        return p switch
        {
            0 => $"{loc.Nouns[rng.Next(loc.Nouns.Count)]} {loc.Connectors[rng.Next(loc.Connectors.Count)]} {loc.Places[rng.Next(loc.Places.Count)]}",
            1 => $"{loc.VerbsImperative[rng.Next(loc.VerbsImperative.Count)]} {loc.Nouns[rng.Next(loc.Nouns.Count)]}",
            2 => $"{loc.Adj[rng.Next(loc.Adj.Count)]} {loc.Nouns[rng.Next(loc.Nouns.Count)]}",
            _ => $"{loc.Phrases[rng.Next(loc.Phrases.Count)]}"
        };
    }

    private static List<String> MakeAuthors(LocalePack loc, Random rng)
    {
        int count = rng.Next(100) < 85 ? 1 : 2 + (rng.Next(100) < 20 ? 1 : 0);
        var list = new List<string>(count);
        for (int i = 0; i < count; i++) list.Add(MakePerson(loc, rng));
        return list;
    }

    private static string MakePerson(LocalePack loc, Random rng)
    {
        string first = loc.FirstNames[rng.Next(loc.FirstNames.Count)];
        string last = loc.LastNames[rng.Next(loc.LastNames.Count)];
        if (rng.Next(100) < 20)
        {
            char mi = (char)('A' + rng.Next(26));
            return $"{first} {mi}. {last}";
        }
        return $"{first} {last}";
    }

    private static string MakeReview(LocalePack loc, Random rng)
    {
        var t1 = loc.ReviewStarters[rng.Next(loc.ReviewStarters.Count)];
        var t2 = loc.ReviewBodies[rng.Next(loc.ReviewBodies.Count)];
        return $"{t1} {t2}";
    }

    private static int SampleMeanWithFraction(double mean, Random rng)
    {
        if (mean <= 0) return 0;
        int baseInt = (int)Math.Floor(mean);
        double frac = mean - baseInt;
        return baseInt + (rng.NextDouble() < frac ? 1 : 0);
    }

    private static string EscapeXml(string s)
        => s.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");
}
