import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker/locale/en";
import { Factory } from "fishery";
import { np } from "./non-plain-objects.ts";

type ReportBody = {
  content: string;
  summary: string;
  extra?: string;
};

type Report = {
  name: string;
  body: ReportBody;
};

const reportBodyFactory = Factory.define<ReportBody>(() => {
  return {
    content: faker.lorem.word(),
    summary: faker.lorem.word(),
    // deliberately omit extra so it can be merged in
  };
});

const reportFactory = Factory.define<Report>(() => {
  return {
    name: faker.person.firstName(),
    body: reportBodyFactory.build(),
  };
});

describe("plain objects", () => {
  it("recursively merges properties of nested objects into new objects", () => {
    const body = reportBodyFactory.build();
    const report = reportFactory.build({ body: { extra: "test" } }, { associations: { body } });

    expect(report.body).not.toBe(body);
    expect(report.body.content).toEqual(body.content);
    expect(report.body.summary).toEqual(body.summary);
    expect(report.body.extra).toEqual("test");
  });
});

describe("non plain objects", () => {
  it("replaces non plain properties without merging", () => {
    const body = np(reportBodyFactory.build());
    const report = reportFactory.build({ body: { extra: "test" } }, { associations: { body } });

    expect(report.body).toBe(body);
    expect(report.body.content).toEqual(body.content);
    expect(report.body.summary).toEqual(body.summary);
    expect(report.body.extra).not.toEqual("test");
  });
});
