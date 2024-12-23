# needed more memory to run go
# sub in the command as needed
#  
docker run --rm -v $(pwd):/code:ro --mount type=tmpfs,target=/run -w /code --cpus="1" --memory="1g" --user root test-env bash -c "cp test.txt temp.* ../run && cd ../run && timeout 60s tsc temp.ts && node temp.js < test.txt"; 
exit_code=$?; 
[ $exit_code -eq 124 ] && echo "Error: execution timed out" >&2; 
exit $exit_code;