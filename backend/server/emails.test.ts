import { verifyEmailHtml } from "./emails";

it("generates an email template", () => {
  expect(
    verifyEmailHtml({
      username: "specialuser",
      verify_url: "https://jam.link/verify/123",
    })
  ).toMatchSnapshot();
});

it("throws an error if we don't complete all the templates", () => {
  expect(() =>
    verifyEmailHtml({
      username: "specialuser",
    })
  ).toThrowError("Expected locals to define verify_url");
});
