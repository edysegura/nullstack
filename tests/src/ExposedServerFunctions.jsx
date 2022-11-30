import Nullstack from 'nullstack';

async function request(method) {
  const body = {
    number: 69,
    date: new Date(),
    string: 'nullstack'
  }
  const response = await fetch(`/data/${method}/param?query=query&truthy=true&falsy=false`, {
    method: method.toUpperCase(),
    body: method === 'get' ? undefined : JSON.stringify(body)
  })
  const data = await response.json()
  return data.status
}

class ExposedServerFunctions extends Nullstack {

  static async getData({ request, project, param, query, truthy, falsy, number, date, string }) {
    return {
      status: (
        param === 'param'
        && query === 'query'
        && truthy === true
        && falsy === false
        && project.name === 'Nullstack Tests'
        && (request.originalUrl.includes('/get/') || (
          number === 69
          && date.getFullYear() === new Date().getFullYear()
          && string === 'nullstack'
        ))
      )
    }
  }

  async hydrate() {
    this.all = await request('get')
    this.get = await request('get')
    this.post = await request('post')
    this.put = await request('put')
    this.patch = await request('patch')
    this.delete = await request('delete')
  }

  render() {
    return (
      <div
        data-get={this.get}
        data-post={this.post}
        data-put={this.put}
        data-patch={this.patch}
        data-delete={this.delete}
        data-all={this.all}
      />
    )
  }

}

export default ExposedServerFunctions;