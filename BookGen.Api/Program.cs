using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using BookGen.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(opts =>
{
    opts.AddDefaultPolicy(policy => policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddSingleton<BookGenService>();

var app = builder.Build();
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

// Books batch
app.MapGet("/api/books", (
    string region,
    long seed,
    double likes,
    double reviews,
    BookGenService gen,
    int page = 1,
    int size = 20
) => Results.Ok(gen.GenerateBooks(region, seed, likes, reviews, page, size)));

// Book details
app.MapGet("/api/book/details", (
    string region,
    long seed,
    int index,
    double likes,
    double reviews,
    BookGenService gen
) => Results.Ok(gen.GenerateDetails(region, seed, index, likes, reviews)));

// Deterministic SVG cover
app.MapGet("/api/cover.svg", (
    string region,
    long seed,
    int index,
    BookGenService gen
) => Results.Text(gen.GenerateCoverSvg(region, seed, index, 480, 640), "image/svg+xml; charset=utf-8", Encoding.UTF8));

// CSV export
app.MapGet("/api/export.csv", async (
    HttpResponse resp,
    string region,
    long seed,
    double likes,
    double reviews,
    int total,
    BookGenService gen
) =>
{
    resp.ContentType = "text/csv; charset=utf-8";
    resp.Headers.ContentDisposition = "attachment; filename=books.csv";

    await using var writer = new StreamWriter(resp.Body, Encoding.UTF8, leaveOpen: true);
    var cfg = new CsvConfiguration(CultureInfo.InvariantCulture) { HasHeaderRecord = true };
    using var csv = new CsvWriter(writer, cfg);

    // header
    csv.WriteField("Index");
    csv.WriteField("ISBN");
    csv.WriteField("Title");
    csv.WriteField("Authors");
    csv.WriteField("Publisher");
    csv.NextRecord();

    const int pageSize = 50;
    int written = 0;
    int page = 1;

    while (written < total)
    {
        var batch = gen.GenerateBooks(region, seed, likes, reviews, page, pageSize);
        foreach (var b in batch)
        {
            if (b.Index > total) break;
            csv.WriteField(b.Index);
            csv.WriteField(b.ISBN);
            csv.WriteField(b.Title);
            csv.WriteField(string.Join(", ", b.Authors));
            csv.WriteField(b.Publisher);
            csv.NextRecord();
        }
        written += batch.Count;
        page++;
    }

    await writer.FlushAsync();
});

app.Run();