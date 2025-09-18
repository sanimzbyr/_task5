namespace BookGen.Api.Services;

public static class Isbn
{
    public static string GenerateIsbn13(Random rng)
    {
        int[] digits = new int[13];
        digits[0] = 9; digits[1] = 7; digits[2] = 8;
        for (int i = 3; i < 12; i++) digits[i] = rng.Next(10);
        int sum = 0;
        for (int i = 0; i < 12; i++) sum += digits[i] * ((i % 2 == 0) ? 1 : 3);
        int check = (10 - (sum % 10)) % 10;
        digits[12] = check;
        return $"{digits[0]}{digits[1]}{digits[2]}-{digits[3]}{digits[4]}{digits[5]}-{digits[6]}{digits[7]}{digits[8]}{digits[9]}{digits[10]}-{digits[11]}-{digits[12]}";
    }
}