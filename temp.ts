  async createResult(insertResult: InsertResult): Promise<Result> {
    const id = this._resultIdCounter++;
    const result: Result = { ...insertResult, id };
    this._results.set(id, result);
    return result;
  }
