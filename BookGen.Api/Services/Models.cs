namespace BookGen.Api.Services;

public record BookRow(
    int Index,
    string ISBN,
    string Title,
    List<string> Authors,
    string Publisher
);

public record BookDetails(
    int Index,
    string Title,
    List<string> Authors,
    string Publisher,
    string CoverUrl,
    int Likes,
    List<(string Reviewer, string Text)> Reviews
);